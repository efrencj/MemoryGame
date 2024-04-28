// Variables globals
var separacioH=20, separacioV=20; // Separació entre cartes
var nFiles=2, nColumnes=2; // Files i columnes
var numCartesJugar = 0; // Numero que escull l'usuari per jugar cartes
var numCartesMa = 52; // Mà "deck" per defecte
var guanyat=false; // Variable que controla si el jugador ha guanyat
var comptadorClics = 0; // Variable que fa el recompte de clicks del joc
var marcadorMostrat = false; // Variable que controla que la finestra de marcador sigui visible
var elapsedTime; // Calcula el temps transcurrit

// Mà amb la que es genera el joc
var ampladaCarta = 80, alcadaCarta = 120; // Se li assigna l'alçada i l'amplada del taulell dinàmicament
var barallaMa = [];
var maTriada = 'carta';
var maDavant = 'davant';
var maDarrera = 'darrera';
var cartaWidth = 120;
var cartaHeigh = 160;

/**
 * Funció que genera tot el joc
 */
function iniciaJoc () {
    $('#marcador').fadeOut(150);
    marcadorMostrat = false;

    actualitzarPanellInfo();

    crearMa();
    
    midesGenerals();
    
    // Doble iteració per generar les cartes en el taulell
    let comptadorCartes = 0;
    for (i = 0; i < nFiles; i++) {
        for (j = 0; j < nColumnes; j++) {
            if (comptadorCartes !== numCartesJugar) {
                generarCarta(i+1, j+1);
                comptadorCartes++;
            }
        }
    }

    controlarCartes();

    temporitzadorJoc();
}

/**
 * Funció que s'executa al carregar la pàgina i que recupera el temps i la modalitat de joc en la que s'ha guardat l'anterior partida 
 */
function carregarTemps() {
    $('#cartesEnregistrades').text(`${localStorage.getItem("cartesJoc")} cartes`);
    $('#tempsEnregistrat').text(`${localStorage.getItem("temps")} segons`);
}

/**
 * Funció que mostra la finestra del marcador
 */
function mostrarUltimTemps() {
    if (marcadorMostrat) {
        $('#marcador').fadeOut(150);
        marcadorMostrat = false;
    } else {
        $('#marcador').fadeIn(150);
        marcadorMostrat = true;
    }
}

/**
 * Funció que executa el joc segons les dues modalitats en les que es pot iniciar:
 *      - Si es prem un botó de mode, entra directament al joc
 *      - Si tria el numero de cartes, es verifica que siguin correctes i inicia el joc
 */
function comprobarCartes (numCartes) {
    if (numCartes !== 0) {
        numCartesJugar = numCartes;
        comprobacio = true;
    } else {
        comprobacio = comprobarNumCorrecte();
    }
    if (comprobacio) {
        $('#menuInicial').css('display', 'none')
        $('#footer').css('display', 'block')
        $('#tauler').css('display', 'block')
        $('#btnMarcador').css('display', 'none')
        $('#panellInfo').css('display', 'block')
        $('#temporitzador').show();
        $('#botoInici').show();
        reproducirSonidotaulell();
        iniciaJoc();
    } else {
        $('#footer').css('display', 'none')
        $('#tauler').css('display', 'none')
        $('#btnMarcador').css('display', 'block')
        $('#panellInfo').css('display', 'none')
    }
}

/**
 * Funció que posa l'input en diferents colors èr
 * @returns Comprobació si el numero introduit pel jugador
 */
function comprobarNumCorrecte () {
    let inp = $('#numCartes');
    numCartesJugar = parseInt(inp.val());
    if (numCartesJugar!="" && numCartesJugar%2===0 && numCartesJugar<= numCartesMa && numCartesJugar > 0) {
        inp.removeClass('numIncorrecte');
        return true;
    } else {
        if (isNaN(numCartesJugar) || numCartesJugar === 0) {
            inp.val('');
            inp.attr('placeholder', 'Introdueix un numero...')
            inp.removeClass('numIncorrecte');
        } else {
            inp.addClass('numIncorrecte');
        }
        return false;
    }
}   

/**
 * Funció que actualitza la informació del panell conforme progresa el joc
 */
function actualitzarPanellInfo () {
    $('#panellInfo').text(`Clics màxims: ${numCartesJugar * 3} | Clicks restants: ${(numCartesJugar * 3) - comptadorClics}`)
}

/**
 * Funció que escolta als botons que trien cada mà i aplica les configuracions òptimes
 * @param jugaAmb Cartes amb les que es juga
 * @param carta Passa la carta seleccionada
 */
function numCartesDeMa (jugaAmb, carta, maTriadaHTML, maDavantHTML, maDarreraHTML) {
    numCartesMa = jugaAmb;
    $('.maTriadaJoc').css({ // Posa els atributs css a la mà seleccionada
        'filter' : 'grayscale(90%)',
        'box-shadow' : '0px 0px 0px 0px'
    })
    $(carta).css({ // Treu els atributs css a la mà seleccionada
        'filter' : 'none',
        'box-shadow' : 'rgba(50, 50, 93, 0.25) 0px 30px 60px -12px, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px'
    })
    // Assigna els valors a les variables globals
    maTriada = maTriadaHTML;
    maDavant = maDavantHTML;
    maDarrera = maDarreraHTML;
    // Condició que assigna els valors dels tamanys de les variables globals per tal de generar el joc dinàmicament
    if (maTriada == 'carta') {
        cartaWidth = 120;
        cartaHeigh = 160;
        ampladaCarta = 80;
        alcadaCarta = 120;
    } else if (maTriada == 'cartaP') {
        cartaWidth = 151;
        cartaHeigh = 151;
        ampladaCarta = 111;
        alcadaCarta = 111;
    } else {
        cartaWidth = 118;
        cartaHeigh = 160;
        ampladaCarta = 78;
        alcadaCarta = 120;
    }
    comprobarNumCorrecte();
}

/**
 * Funció que genera la mà i controla el numero de cartes
 */
function crearMa () {
    // S'afegeixen totes les cartes a l'array 'barallaMa'.
    for(let i = 1; i <= numCartesMa; i++){
        // Condició que controla que la mà no sigui "cartaP" i la carta no sigui la 8 (la part de darrera de les cartes)
        if (maTriada === 'cartaP' && i === 8) barallaMa.push(maTriada + i + 1); 
        else barallaMa.push(maTriada + i);
    }

    // Gestió de columnes i files
    nColumnes = numCartesJugar === 2 || numCartesJugar === 4 ? 2 : trobarFactor();
    nFiles = Math.round(numCartesJugar / nColumnes);

    barrejar(barallaMa); // Es barreja totes les cartes de la mà per tal de poder obtenir cartes aleatories en el joc.
    barallaMa = barallaMa.slice(0,(nFiles*nColumnes)/2); // Crea una copia de l'array original
                                                         /* Es multiplica el nombre de files i columnes i es divideix entre 2
                                                            per obtenir el total de cartes amb què es jugarà */
    
    barallaMa.push(...barallaMa) // Duplica los valores del array

    // Es barrejen les dues mans per tal de obtenir dues mans diferents i així després jugar amb diferents cartes.
    barrejar(barallaMa);
}

/**
 * FIXME: Solucionar cálculos
 * Fa un càcul per tal de quadrar correctament les columnes i així tenir una bona distribució del taulell
 * @returns nColumnes
 */
function trobarFactor () {

    let divisors = [];

    // Iteració que controla que els divisors no siguin ni 1 ni el propi numero
    for (i = 1; i <= numCartesJugar; i++) {
        if (numCartesJugar%i === 0 && i !== 1 && i !== numCartesJugar) divisors.push(i);
    }

    if (divisors.length === 1) { // Retorna el divisor en cas de que només existeixi un
        return divisors[0];
    } else {
        let divisorMigGran = divisors[Math.round(divisors.length / 2)];
        let divisorMigPetit = divisors[Math.round(divisors.length / 2)-1];
        if (divisorMigPetit+1 != divisorMigGran) {
            let diferencia = (divisorMigGran - divisorMigPetit);
            if((divisorMigGran-(Math.round(diferencia/2)))%2==1){return divisorMigGran-(Math.round(diferencia/2))+1; }
            return divisorMigGran-(Math.round(diferencia/2));
        }
        if(divisorMigGran%2==1) divisorMigGran+1;
        return divisorMigGran;
    }
}

/**
 * Funció que controla les mides del taulell de joc i les cartes
 */
function midesGenerals () {
    // Càlcul per tal d'ajustar el taulell a la quantitat de cartes a jugar. Mida del tauler:
        // 2 x 2 => 20
        // 3 x 3 => 40
        // 4 x 4 => 60
    let totalRestarFiles = 0;
    let totalRestarColumnes = 0;

    if (nFiles > 1) {
        totalRestarFiles = 20 * (nFiles - 1);
    }

    if (nColumnes > 1) {
        totalRestarColumnes = 20 * (nColumnes - 1);
    }

    $("#tauler").css({
        "width" : `${cartaWidth * nColumnes - totalRestarColumnes}px`,
        "height": `${cartaHeigh * nFiles - totalRestarFiles}px`
    });

}

/**
 * Funció que barreja les cartes de les mans.
 * La funció genera un numero aleatori i calcula les posicions de l'array. Amb aquestes mesures reparteix
 *  aleatoriament les cartes per les posicions de l'array.
 * @param array[] Mà de cartes
 */
function barrejar(array) {
    let quants = array.length;
    for(i=0;i<array.length;i++){
        let rnd = Math.floor(Math.random()*quants);
        let aux = array[i];
        array[i]=array[rnd];
        array[rnd] = aux;
    }
}

/**
 * Funció que genera cada carta dintre del taulell
 * @param f Fila iterant
 * @param c Columna iterant
 */
function generarCarta(f, c) {
    let cartaID = `f${f}c${c}`;
    let cartaHTML = `<div class="${maTriada}" id="${cartaID}"><div class="cara ${maDarrera}"></div><div class="cara ${maDavant}"></div></div>`;
    $('#tauler').append(cartaHTML);

    let carta = $(`#${cartaID}`);
    carta.css({
        "top"  :  ((f-1)*(alcadaCarta+separacioV)+separacioV)+"px",
        "left" :  ((c-1)*(ampladaCarta+separacioH)+separacioH)+"px"
    });
    carta.find(`.${maDavant}`).addClass(barallaMa.pop());
}

/**
 * Funció que escolta als clicks del ratolí
 */
function controlarCartes () {
    // Funció que salta quan es fa click sobre alguna de les cartes
    let dosClicks = 0;
    let par1, par2;
    $(`.${maTriada}`).on("click", function() {
        if (dosClicks === 1 && par1[0] === this) {
            return; // No fer res si es fa clic a la mateixa carta.
        }
        $(this).toggleClass("carta-girada"); // Auqesta funció gira les cartes
        if(dosClicks === 0){
            par1=$(this);
        }
        
        dosClicks++;
        comptadorClics++;
        actualitzarPanellInfo(); 
        if (dosClicks === 2) {
            par2 = $(this);
            // Obté les classes de les cares davanteres de les cartes
            let clasePar1 = par1.find(`.${maDavant}`).attr('class');
            let clasePar2 = par2.find(`.${maDavant}`).attr('class');
            $(`.${maTriada}`).addClass('noClick'); // Afegeix la classe noClick 
        
            // Timeout que comprova les cartes clickades
            setTimeout(() => {
                if (clasePar1 == clasePar2){
                    par2.fadeOut(100); // Les cartes desapareixen lentament
                    par1.fadeOut(100, verificarFinJuego); // Desapareix i després verifica el final del joc
                } else {
                    $(par1).toggleClass("carta-girada");
                    $(par2).toggleClass("carta-girada");
                }
                $(`.${maTriada}`).removeClass('noClick'); // Elimina la classe noClick que bloqueja els events
                setTimeout(() => { // Comprobació que finalitza el joc en cas d'haver superat el màxim de clicks
                    if (comptadorClics >= (numCartesJugar * 3) && !guanyat) verificarFinJuego(true, 'Màxim de clics superat! Has perdut.');  
                }, 125) // Retard de 125ms per rebre l'actualització de la variable "guanyat"
            }, 600); // Retard de 600ms             
            dosClicks = 0;
        } 
    });
}

/**
 * Función que controla el temporizador del juego
 */
function temporitzadorJoc() {
    // Temporitzador
    let tiempoRestante = 3 * numCartesJugar; // Calcular el temps total basat en el nombre de cartes
    $("#temporitzador").attr("max", tiempoRestante); // Establir el valor màxim de la barra
    $("#temporitzador").val(tiempoRestante); // Inicialitzar la barra de temps amb el valor màxim
    let startTime = Date.now(); // Guardar el temps d'inici

    function tick() {
        elapsedTime = Date.now() - startTime; // Calcular el temps transcorregut
        let tiempoActual = tiempoRestante - Math.floor(elapsedTime / 1000); // Calcular el temps restant

        if (!guanyat) {
            $("#temporitzador").val(tiempoActual); // Actualitzar el valor de la barra de temps

            if (tiempoActual <= 5) { // Quan quedin 5 segons, es reprodueix un so de tensió
                reproducirSonidoPocoTiempo();
            }

            if (tiempoActual <= 0) { // Quan el temps s'acabi, realitzar diverses accions
                pausarSonidoPocoTiempo(); // Pausar el so de tensió
                pausarSonidoTaulell(); // Pausar un altre so que estigui reproduint-se
                senseTemps(); // Funció per manejar el final del temps
                verificarFinJuego(true, 'T\'has quedat sense temps! Has perdut.'); // Verificar si el joc ha de acabar
            } else {
                requestAnimationFrame(tick); // Continuar el cicle del temporitzador
            }
        }
    }

    requestAnimationFrame(tick); // Iniciar el temporitzador amb requestAnimationFrame
}


/**
 * Funció que torna al menú principal
 */
function tornarAlMenu(){
    location.href="index.html";
}

/**
 * Funcions de so
 */
function senseTemps(){
    let audio = document.getElementById("perdut");
    audio.play();
}
function pausarSonidoPocoTiempo(){
    let audio = document.getElementById("PocTemps");
    audio.pause();
}
function pausarSonidoMenu() {
    let audio = document.getElementById("menuSound");
    audio.pause();
}
function pausarSonidoTaulell() {
    let audio = document.getElementById("taulerSound");
    audio.pause();
}
function reproducirSonidoPocoTiempo(){
    let audio = document.getElementById("PocTemps");
    audio.play();
}
function reproducirSonidoMenu() {
    let audio = document.getElementById("menuSound");
    audio.play();
}
function reproducirSonidotaulell() {
    let audio = document.getElementById("taulerSound");
    audio.play();
}

/**
 * Funció que finalitza el joc
 */
function verificarFinJuego(tiempoAgotado, mensajeAlert) {
    let cartas = $(`.${maTriada}`); 
    let todasOcultas = true;

    // Comproba que totes les cartes estiguin ocultes al taulell
    cartas.each(function() {
        if ($(this).css('display') !== 'none') {
            todasOcultas = false;
        }
    });

    if (todasOcultas) { // Totes ocultes = l'usuari guanya
        guanyat=true;
        localStorage.setItem("cartesJoc", numCartesJugar)
        localStorage.setItem("temps", elapsedTime.toString()[0])
        alert('¡Felicidades! Has completado el juego.');
        tornarAlMenu();
    } else if (tiempoAgotado) { // Qualsevol altre condició, el joc ha finalitzat + missatge personalitzat
        guanyat = false;
        alert(mensajeAlert)
        tornarAlMenu();
    }
}