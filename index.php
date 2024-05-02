<?php
// Include la classe Database.php
include 'database.php';

// Funzioni PHP
function openProject() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['projectFile'])) {
        $file = $_FILES['projectFile'];
        
        // Percorso in cui vuoi decomprimere il file
        $decompressPath = 'projects/';

        // Controlla l'estensione del file
        if (pathinfo($file['name'], PATHINFO_EXTENSION) === 'zip') {
            // Decomprimi il file zip
            $zip = new ZipArchive();
            if ($zip->open($file['tmp_name']) === TRUE) {
                $zip->extractTo($decompressPath);
                $zip->close();
                
                echo json_encode(['success' => true, 'message' => 'File decompressed successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to decompress file.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid file type. Please upload a zip file.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    }
}

function saveProject() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['projectName']) && isset($data['code'])) {
            // Connessione al database
            $db = new Database();
            $conn = $db->getConnection();

            // Estrai i dati
            $projectName = $data['projectName'];
            $threejsCode = $data['code'];

            // Query per inserire il progetto nel database
            $query = "INSERT INTO projects (name, code) VALUES (?, ?)";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ss", $projectName, $threejsCode);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Project saved successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to save project.']);
            }

            $stmt->close();
            $conn->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid input data.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    }
}

function exportProject() {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $db = new Database();
        $conn = $db->getConnection();

        $query = "SELECT name FROM projects";
        $result = $conn->query($query);

        $files = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $files[] = $row['name'];
            }
            $result->free();
        }

        $conn->close();

        $zipFilePath = 'exports/project_export.zip';

        if (compressFiles($files, $zipFilePath)) {
            header('Content-Type: application/zip');
            header('Content-Disposition: attachment; filename="project_export.zip"');
            header('Content-Length: ' . filesize($zipFilePath));

            readfile($zipFilePath);
            unlink($zipFilePath);
        } else {
            header('HTTP/1.1 500 Internal Server Error');
            echo 'Errore durante la compressione del progetto';
        }
    } else {
        header('HTTP/1.1 405 Method Not Allowed');
        echo 'Metodo di richiesta non supportato';
    }
}

// Funzione per comprimere i file in un archivio zip
function compressFiles($files, $zipFilePath) {
    $zip = new ZipArchive();
    if ($zip->open($zipFilePath, ZipArchive::CREATE) !== TRUE) {
        return false;
    }

    foreach ($files as $file) {
        $filePath = 'projects/' . $file;
        if (file_exists($filePath)) {
            $zip->addFile($filePath, $file);
        }
    }

    $zip->close();
    return true;
}

// Controlla l'azione da eseguire basandosi sul parametro GET
$action = $_GET['action'] ?? null;

switch ($action) {
    case 'open':
        openProject();
        break;
    case 'save':
        saveProject();
        break;
    case 'export':
        exportProject();
        break;
    default:
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => 'Invalid action parameter.']);
        break;
}

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css" type="text/css">
    <link rel="stylesheet"href="styles.css"type="text/css">
    <script src="jbul.js"></script>
    <script src="https://threejs.org/build/three.js"></script>
    <title>OpenGL and Three.js App</title>
    
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
            fetch('?action=open', {
                method: 'POST',
                body: new FormData(document.getElementById('open-form'))
            })
            .then(response => response.json())
            .then(data => {
                console.log('File aperto:', data);
                // Elabora i dati ricevuti (il codice Three.js, ad esempio)
                threejsCode.value = data.code;
            })
            .catch(error => {
                console.error('Errore nell\'apertura del file:', error);
            });
        }

        // Funzione per salvare un file
        function saveFile() {
            const data = {
                projectName: prompt("Inserisci il nome del progetto:"),
                code: threejsCode.value
            };

            fetch('?action=save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log('File salvato:', data);
            })
            .catch(error => {
                console.error('Errore nel salvataggio del file:', error);
            });
        }

        // Funzione per esportare un file
        function exportFile() {
            window.location.href = '?action=export';
        }
    </script>
</body>

</html>
