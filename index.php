<?php
// Include il file PHP con la classe Database
include 'Database.php';
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css" type="text/css">
    <title>OpenGL and Three.js App</title>
    <script src="https://threejs.org/build/three.js"></script>
    <script src="app.js"></script>
</head>

<body>
    <nav class="nav navbar">
        <ul class="nav">
            <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="javascript:openFile()">Open</a></li>
            <li class="nav-item"><a class="nav-link" href="javascript:saveFile()">Save</a></li>
            <li class="nav-item"><a class="nav-link" href="javascript:exportFile()">Export</a></li>
            <li class="nav-item"><a class="nav-link" href="code.php">Three.js Code</a></li>
        </ul>
    </nav>

    <main>
        <section id="editor">
            <h2>Three.js Code Editor</h2>
            <textarea id="threejs-code" rows="10" cols="50" placeholder="Write your Three.js code here..."></textarea>
            <button id="run-code">Run Code</button>
        </section>

        <section id="canvas-container">
            <h2>Three.js Canvas</h2>
            <div id="canvas"></div>
        </section>
    </main>

    <script>
        const canvasContainer = document.getElementById("canvas");
        const threejsCode = document.getElementById("threejs-code");
        const runCodeButton = document.getElementById("run-code");

        // Funzione per eseguire il codice Three.js inserito dall'utente
        function runThreejsCode() {
            try {
                // Rimuovi il contenuto precedente del canvas
                while (canvasContainer.firstChild) {
                    canvasContainer.removeChild(canvasContainer.firstChild);
                }

                // Crea un nuovo contesto Three.js
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth, window.innerHeight);
                canvasContainer.appendChild(renderer.domElement);

                // Esegui il codice Three.js dell'utente
                eval(threejsCode.value);

                // Funzione di animazione
                function animate() {
                    requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                }
                animate();
            } catch (error) {
                console.error("Errore nell'esecuzione del codice Three.js:", error);
            }
        }

        // Evento per il pulsante "Run Code"
        runCodeButton.addEventListener("click", runThreejsCode);

        // Funzione per aprire un file
function openFile() {
    fetch('open.php', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        // Elabora i dati ricevuti (il file aperto)
        console.log('File aperto:', data);
        // Visualizza il file o utilizza i dati ricevuti come necessario
        // Ad esempio, mostra il contenuto del file su un elemento HTML
    })
    .catch(error => {
        console.error('Errore nell'apertura del file:', error);
    });
}

// Funzione per salvare un file
function saveFile() {
    // Ad esempio, puoi inviare i dati da salvare in formato JSON
    const dataToSave = {
        // Sostituisci con i dati che vuoi salvare
        content: 'contenuto del file da salvare'
    };

    fetch('save.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
    })
    .then(response => response.json())
    .then(data => {
        console.log('File salvato:', data);
        // Mostra una notifica di successo all'utente o esegui altre azioni
    })
    .catch(error => {
        console.error('Errore nel salvataggio del file:', error);
    });
}

// Funzione per esportare un file
function exportFile() {
    // Invia una richiesta a un endpoint per esportare un file
    fetch('export.php', {
        method: 'GET',
    })
    .then(response => response.blob())
    .then(blob => {
        // Crea un link di download per il file esportato
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'file_esportato.txt'; // Sostituisci con il nome e l'estensione del file esportato
        link.click();
        URL.revokeObjectURL(url);
        console.log('File esportato con successo');
    })
    .catch(error => {
        console.error('Errore nell\'esportazione del file:', error);
    });
}

    </script>
</body>

</html>
