"use strict";

//les balles du niveau en cours
var balls;

//les couleurs disponibles dans le jeu
var colors;
//les tailles disponibles dans le jeu
var sizes;
// numero du niveau en cours
var currentLevel;
//nom de l'ecran en cours
var currentScreen;
//liste des niveaux
var levels;

//l'increment pour l'affichage dans le canva
var i;

//l'objet interval pour le rafraichissement du canva
var inter;
//le contexte
var ctx;
//le canva
var monCanvas;
//le timout pour l'arret du jeu
var timeout;
//duree restante du jeu en ms
var timer;
//l'objet interval pour l'affichage du temps restant
var timerDisplay;
//nb de clics ok
var clicOk = 0;
//nb de clics dans le vide ou sur une mauvaise balle
var clicKo = 0;
var ballToClic=0;

$(function () {
    init();


});

function init() {
    //structure
    $('#titre').html("La theorie des balles");
    $('#image').html($("<img>").attr("src", "img/image.png"));
    $('#texte').html("Regles du jeu : Cliquer sur les balles selon leur taille et leur couleur<br/> Pour chaque clic correct, le temps restant au jeu est incremente de 500ms");
    $('#boutonJeu').html('<input type="submit" name="submit"/ value="Jouer">');

    $('#consigne').html("Consigne");
    $('#animation').html('<canvas id="dessin" width="640" height="480">');
    $('#boutonQuitter').html('<input type="submit" name="submit"/ value="Quitter">');
    $('#bonus').html('Bonus');

    $('#recap').html("");
    $('#boutonAccueil').html('<input type="submit" name="submit"/ value="Accueil">');
    $('#boutonRejouer').html('<input type="submit" name="submit"/ value="Rejouer">');
    $('footer').html("MOOC HTML5 - Thom de Savoie");

    //Tailles disponibles
    sizes = [initSize(25, "grande", 150), initSize(17, "moyenne", 100), initSize(10, "petite", 50)];
    //Couleurs disponibles
    colors = [initColor("#FF0000", "rouge"), initColor("#FF00FF", "fuschia"), initColor("#228B22", "vert"), initColor("#ffa500", "orange")];
    //Initialisation des niveaux
    levels = [];
    for (var j = 0; j < 15; j++) { //niveaux crees aleatoirement
        var level = new Object();
        var color = Math.floor(Math.random() * colors.length);
        level.color = colors[color];
        var size = Math.floor(Math.random() * sizes.length);
        level.size = sizes[size];
        levels.push(level);
    }


    //gestionnaires
    initButtonHandler();
    i = 0;


    //init canva
    monCanvas = document.getElementById('dessin');
    if (monCanvas.getContext) {
        ctx = monCanvas.getContext('2d');
    } else {
        alert('canva non supporte');
    }
    monCanvas.addEventListener("click", clicCanvas, false);

    //lancement
    afficheAccueil();
}

function initBalls() {
    //initialisation des balles pour 1 niveau : entre 2 et 10 balles sont generees
    //la taille, la couleur, et la vitesse sont aleatoires
    var nbBalls = Math.floor((Math.random() * 9) + 2);
    balls = [];
    for (var ballId = 0; ballId < nbBalls; ballId++) {
        var size = Math.floor(Math.random() * sizes.length);
        var color = Math.floor(Math.random() * colors.length);
        var speed = Math.floor(Math.random() * 3) + (currentLevel + 1);
        var location = 100 + (ballId * 40);
        balls.push(initBall(location, 0, sizes[size].size, colors[color], true, speed));
    }
}

function initBall(xCoord, yCoord, size, color, displayed, baseSpeed) {
    var ball = new Object();
    ball.x = xCoord;
    ball.y = yCoord;
    ball.size = size;
    ball.display = displayed;
    ball.color = color;
    ball.baseSpeed = baseSpeed;
    var lvl = levels[currentLevel];
    if (lvl.size.size == size && lvl.color == color) {
        ball.waitClic = true;
        ballToClic++;
    } else {
        ball.waitClic = false;
    }
    return ball;
}

function initSize(size, label, labelSize) {
    var obj = new Object();
    obj.size = size;
    obj.label = label;
    obj.labelSize = labelSize;
    return obj;
}
function initColor(color, label) {
    var obj = new Object();
    obj.color = color;
    obj.label = label;
    return obj;
}

function initButtonHandler() {
    $("#boutonJeu").click(function () {
        afficheJeu();
        afficheConsigne();
    });
    $("#boutonRejouer").click(function () {
        afficheJeu();
        afficheConsigne();
    });
    $("#boutonAccueil").click(function () {
        afficheAccueil();
    });
    $("#boutonQuitter").click(function () {
        Stopper();
    });
}

//affichage de la consigne en fonction des parametres du niveau en cours
function afficheConsigne() {
    if (currentScreen == "jeu" && currentLevel < levels.length) {
        var selectedColor = levels[currentLevel].color;
        var selectedSize = levels[currentLevel].size;
        $('#consigne').html("Cliquer sur les <span style=\"color:" + selectedColor.color + ";font-size:" + selectedSize.labelSize + "%\">balles</span> de couleur " + selectedColor.label + " et de taille " + selectedSize.label);
    }
}


function afficheJeu() {
    //affichage du jeu
    currentScreen = "jeu";
    $('#accueil').hide();
    $('#jeu').show();
    $('#bilan').hide();
    //reinitialisation du niveau et du compteur de clic
    currentLevel = 0;
    clicOk = 0;
    clicKo=0;
    ballToClic=0;
    //initialisation des balles
    initBalls();
    //avec cette boucle on s'assure qu'il y a au moins 1 balle a cliquer
    // ex qui poserait probleme : niveau a balles rouges et grandes mais que des balles vertes sont generees
    while (isEndOfLevel()) {
        initBalls();
    }
    //on anime toutes les 100ms
    inter = setInterval(Animer, 100);
    //duree du jeu
    timer = 30000;
    //duree restante du jeu affichee toutes les 100ms
    timerDisplay = setInterval(ChangeAndDisplayTimer, 100);
    DisplayTimer();
    //le timeout
    timeout = setTimeout(Stopper, timer);
}

function afficheBilan() {
    currentScreen = "bilan";
    $('#accueil').hide();
    $('#jeu').hide();
    $('#bilan').show();
    $('#recap').html("clics corrects/clics incorrects/nombre de points maximal : " + clicOk+"/"+clicKo+"/"+ballToClic);
}

function afficheAccueil() {
    currentScreen = "accueil";
    $('#accueil').show();
    $('#jeu').hide();
    $('#bilan').hide();
}


function ChangeAndDisplayTimer() {
    DisplayTimer();
    timer -= 100;
}

//afiche le temps restant et le niveau en cours
function DisplayTimer() {
    if (currentScreen == "jeu") {
        $('#timer').html("Niveau : " + (currentLevel + 1) + "/" + levels.length + ". Temps restant " + (timer / 1000) + "s");
    }
}

function Animer() {
    i += 1;
    //effacement du canva
    ctx.clearRect(-100, -100, monCanvas.width + 100, monCanvas.height + 100);
    //affichage des balles
    for (var ballId = 0; ballId < balls.length; ballId++) {
        dessineBalle(ballId);
    }
    //detection fin de niveau et passage au niveau suivant
    if (isEndOfLevel()) {
        newLevel();
    }

}

//fin de niveau : si aucune balle ne reste a cliquer (waitClic)
function isEndOfLevel() {
    var ended = true;
    for (var ballId = 0; ballId < balls.length; ballId++) {
        var ball = balls[ballId];
        if (ball.waitClic == 1) {
            ended = false;
        }
    }
    return ended;
}
function newLevel() {
    currentLevel++;
    //si on a  fini les niveaux on arrete le jeu
    if (currentLevel >= levels.length) {
        Stopper();
    } else {
        i = 0;
        //changement de consigne
        afficheConsigne();
        //regeneration des balles
        while (isEndOfLevel()) {
            initBalls();
        }
    }
}

function Stopper() {
    clearInterval(inter);
    clearInterval(timerDisplay);
    afficheBilan();

}

function dessineBalle(idCercle) {
    if (balls[idCercle].display) {
        var cercle = balls[idCercle];
        var R = cercle.size;
        var translation = cercle.baseSpeed * i;
        cercle.y = translation;
        ctx.translate(0, translation);
        ctx.beginPath();
        ctx.fillStyle = cercle.color.color;
        ctx.arc(cercle.x, 0, R, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();
        ctx.translate(0, -translation);
        if (translation > monCanvas.height) {
            //si la balle sort du canva elle ne peut plus etre cliquee
            cercle.waitClic = 0;
        }
    }
}


function clicCanvas(e) {
    var goodClic = false;
    // position  de la souris dans le document
    var xSourisDocument = e.pageX;
    var ySourisDocument = e.pageY;

    // position du canva dans le document
    var xCanvas = monCanvas.offsetLeft;
    var yCanvas = monCanvas.offsetTop;

    var xSourisCanvas = xSourisDocument - xCanvas;
    var ySourisCanvas = ySourisDocument - yCanvas;

    for (var c = 0; c < balls.length; c++) {
        var cercle = balls[c];
        var R = cercle.size;
        if (Math.abs(cercle.x - xSourisCanvas) < R && Math.abs(cercle.y - ySourisCanvas) < R) {
            if (cercle.waitClic) {
                //pour chaque clic correct on rajoute 0,5s au timer
                timer += 500;
                clearTimeout(timeout);
                timeout = setTimeout(Stopper, timer);

                $('#bonus').html("Bonus : <span style=\"color:red\"> +0.5s</span>");
                setTimeout(eraseBonus, 1000);
                goodClic = true;
            }
            cercle.display = false;
            cercle.waitClic = false;
            break;
        }
    }
    if (goodClic) {
        clicOk++;
    } else {
        clicKo++;
    }
}
function eraseBonus() {
    $('#bonus').html("Bonus :");
}