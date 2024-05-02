<?php

class Database {
    private $host = 'localhost'; // Inserisci l'host del tuo database
    private $username = 'root'; // Inserisci il nome utente del tuo database
    private $password = ''; // Inserisci la password del tuo database
    private $dbname = 'mydatabase'; // Inserisci il nome del tuo database

    private $connection;

    // Costruttore per inizializzare la connessione al database
    public function __construct() {
        // Usa `mysqli` per connetterti al database
        $this->connection = new mysqli($this->host, $this->username, $this->password, $this->dbname);

        // Verifica se la connessione ha avuto successo
        if ($this->connection->connect_error) {
            die("Connessione al database fallita: " . $this->connection->connect_error);
        }
    }

    // Metodo per ottenere la connessione al database
    public function getConnection() {
        return $this->connection;
    }

    // Metodo per chiudere la connessione al database
    public function closeConnection() {
        if ($this->connection) {
            $this->connection->close();
        }
    }
}

?>
