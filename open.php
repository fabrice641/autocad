<?php

class Database {

    private static $server = 'your_server';
    private static $username = 'your_username';
    private static $password = 'your_password';
    private static $database = 'your_database';
    private $connection;

    public function __construct() {
        try {
            // Crea una nuova connessione al database
            $this->connection = new mysqli(self::$server, self::$username, self::$password, self::$database);

            // Verifica se ci sono errori di connessione
            if ($this->connection->connect_error) {
                throw new Exception("Connessione fallita: " . $this->connection->connect_error);
            }

            echo "Connessione al database avvenuta con successo!";
        } catch (Exception $e) {
            // Gestisce gli errori di connessione
            die("Errore: " . $e->getMessage());
        }
    }

    public function query($sql) {
        try {
            // Esegui la query sul database
            $result = $this->connection->query($sql);

            if (!$result) {
                throw new Exception("Query fallita: " . $this->connection->error);
            }

            // Restituisce i risultati della query
            return $result;
        } catch (Exception $e) {
            // Gestisce gli errori della query
            die("Errore: " . $e->getMessage());
        }
    }

    public function closeConnection() {
        // Chiudi la connessione al database
        $this->connection->close();
    }
}

// Esempio di utilizzo della classe Database
try {
    $db = new Database();

    $sql = "SELECT id FROM tablename WHERE 1";
    $result = $db->query($sql);

    // Itera attraverso i risultati e stampa ogni riga
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . "\n";
    }

    // Chiudi la connessione
    $db->closeConnection();
} catch (Exception $e) {
    die("Errore: " . $e->getMessage());
}
?>
