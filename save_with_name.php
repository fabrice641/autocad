<?php

class Database {
    private $server = 'your_server';
    private $username = 'your_username';
    private $password = 'your_password';
    private $database = 'your_database';
    private $connection;

    // Costruttore della classe che crea una connessione al database
    public function __construct() {
        try {
            // Crea una nuova connessione al database
            $this->connection = new mysqli($this->server, $this->username, $this->password, $this->database);

            // Verifica se ci sono errori di connessione
            if ($this->connection->connect_error) {
                throw new Exception("Connessione fallita: " . $this->connection->connect_error);
            }

            echo "Connessione al database avvenuta con successo!\n";
        } catch (Exception $e) {
            // Gestione degli errori di connessione
            die("Errore: " . $e->getMessage());
        }
    }

    // Metodo per inserire dati nel database
    public function insert($tableName, $columns, $values) {
        try {
            // Crea la query di inserimento
            $sql = "INSERT INTO $tableName ($columns) VALUES ($values)";

            // Esegue la query
            if ($this->connection->query($sql) === true) {
                echo "Record inserito con successo!\n";
            } else {
                throw new Exception("Errore durante l'inserimento: " . $this->connection->error);
            }
        } catch (Exception $e) {
            // Gestione degli errori durante l'inserimento
            die("Errore: " . $e->getMessage());
        }
    }

    // Metodo per chiudere la connessione al database
    public function closeConnection() {
        $this->connection->close();
        echo "Connessione al database chiusa.\n";
    }
}

// Esempio di utilizzo della classe Database
try {
    $db = new Database();

    // Inserisci un record nella tabella
    $tableName = "tablename"; // Sostituisci con il nome della tua tabella
    $columns = "col1, col2, col3"; // Sostituisci con i nomi delle colonne
    $values = "'val1', 'val2', 'val3'"; // Sostituisci con i valori da inserire

    $db->insert($tableName, $columns, $values);

    // Chiudi la connessione
    $db->closeConnection();
} catch (Exception $e) {
    die("Errore: " . $e->getMessage());
}
?>
