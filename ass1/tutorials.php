<?php
  // Start a PHP session
  session_start();
  if (isset($_REQUEST['module'])) {
    $_SESSION['module'] = $_REQUEST['module'];
  }
  if (isset($_REQUEST['time'])) {
    $_SESSION['time'] = $_REQUEST['time'];
  }
  if (isset($_REQUEST['name'])) {
    $_SESSION['name'] = $_REQUEST['name'];
  }
  if (isset($_REQUEST['email'])) {
    $_SESSION['email'] = $_REQUEST['email'];
  }
  if (isset($_REQUEST['submit'])) {
    $_SESSION['submit'] = $_REQUEST['submit'];
  }
?>

<!DOCTYPE html>
<html lang='en-GB'>
  <head>
    <title>Tutorial Session Booking</title>
  </head>
  <body>
  <h1>Tutorial Session Booking</h1>
<?php
  // Connection information for the Departmental MySQL Server
  $db_hostname = "studdb.csc.liv.ac.uk";
  $db_database = "sgdnan2";
  $db_username = "sgdnan2";
  $db_password = "Ellenndy0822";
  $db_charset = "utf8mb4";
  $dsn = "mysql:host=$db_hostname;dbname=$db_database;charset=$db_charset";
  
  // Useful options
  $opt = array(
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false
  );
  
  try {
    $pdo = new PDO($dsn,$db_username,$db_password,$opt);
  } catch (PDOException $e) {
    echo "PDO Error: ".$e->getMessage()."<br>\n";
  }
  
  function printForm() {      
    try {
      global $pdo;
      // Obtain distinct modules that have at least one place left on the tutorial sessions
      $stmt = $pdo->query("select distinct module from tutorials where capacity > 0 order by module");
      
      // Show a message if all places have been booked
      if ($stmt->rowcount() == 0) {
        exit("All tutorials are full.<br>");
      }
      
      // Print the form of module
      echo '<form name="form1" method="post">
            <label>Module:</label>
            <select name="module" onChange="document.form1.submit()" required>
              <option value="">Select a module</option>';
              
      // Print each module option
      foreach($stmt as $row) {
        if ($row["module"] == $_SESSION['module']) {
          // Pre-populate the selected module
          echo "<option selected>",$row["module"],"</option>";
        } else {
          echo "<option>",$row["module"],"</option>";
        }
      }
    echo '  </select>
          </form>';
    
    // Unset the selected time if the module is reselected
    if ($_REQUEST['module']) {
      unset($_SESSION['time']);
    }
    
    // Print the form of time
    echo '<form name="form2" method="post">
            <label>Time:</label>
            <select name="time" required>
              <option value="">Select a time</option>';
              
      // Obtain time of tutorial sessions with at least one place left for that selected module
      if($_SESSION['module']) {
        $sql = "select time from tutorials where module = ? and capacity > 0";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array($_SESSION['module']));
        foreach($stmt as $row) {
          if ($row["time"] == $_SESSION['time']) {
          // Pre-populate the selected time
            echo "<option selected>",$row["time"],"</option>";
          } else {
            echo "<option>",$row["time"],"</option>";
          }
        }
      }
    
    // Print the form of name, email and submit, pre-populate valid name and email
    echo '  </select><br>
            <label>Name: <input type="text" name="name" value="',$_SESSION['name'],'" required></label><br>
            <label>Email address: <input type="text" name="email" value="',$_SESSION['email'],'" required></label><br>
            <input type="submit" value="Submit" name="submit">
          </form>';
    } catch (PDOException $e) {
      // Print error message if something went wrong
      echo "PDO Error: ".$e->getMessage()."<br>\n";
    }
  }
  
  function validateInputs($name,$email) {
    $err = "";
    
    /* A name is valid if it only consists of letters (a-z and A-Z), hyphens, apostrophes and spaces;
      contains no sequence of two or more of the characters hyphen and apostrophe;
      starts with a letter or an apostrophe;
      and does not end in a hyphen. */
    
    if (!preg_match('/^[a-z\-\'\s]*\z/i',$name) ||
        preg_match('/[\-\']{2}/',$name) ||
        !preg_match('/^[a-z\']/i',$name) ||
        preg_match('/\-\z/',$name)) {
      unset($_SESSION['name']);
      $err .= "Please enter your name correctly.<br>\n";
    }
    
    /* An e-mail address is valid if it has exactly one occurrence of @ that is preceded
    and followed by a non-empty sequence of the characters a-z, A-Z, 0-9, dot,
    where neither sequence ends in a dot. */
    
    if(!preg_match('/@[a-z0-9\.]*[a-z0-9]\z/i',$email)) {
      unset($_SESSION['email']);
      $err .= "Please enter your email address correctly.<br>\n";
    }
    return $err;
  }
  
  function processInputs() {
    echo "The booking request has been successful. 
        You have booked a ",$_SESSION['module']," tutorial session on ",$_SESSION['time'],
        ". Your name is ", $_SESSION['name'],
        ". Your email address is ", $_SESSION['email'],".<br>\n";
    session_unset();
    session_destroy();
  }
  
  function book(){
    try {
      global $pdo;
      $pdo->beginTransaction();
      
      // Obtain capacity of selected tutorial session
      // and lock access to the record
      $sql = "select capacity from tutorials where module = ? and time = ? for update";
      $stmt = $pdo->prepare($sql);
      $stmt->execute(array($_SESSION['module'],$_SESSION['time']));
      $row = $stmt->fetch();
      
      // Check whether there is still at least one place left
      if ($row["capacity"] > 0) {
        $sql = "update tutorials set capacity = capacity - 1 where module = ? and time = ?";
        $stmt = $pdo->prepare($sql);
        
        // Decrease capacity of the selected tutorial session by 1
        $stmt->execute(array($_SESSION['module'],$_SESSION['time']));
        
        $sql = "insert into bookings values (?,?,?,?)";
        $stmt = $pdo->prepare($sql);
        
        // Keep a record of the booking
        $stmt->execute(array($_SESSION['module'],$_SESSION['time'],$_SESSION['name'],$_SESSION['email']));
        
        // Show a confirmation that the booking request has been successful
        processInputs();
      } else {
        // Show the various menus and text fields
        printForm();
        
        // Show a confirmation that the booking request has been unsuccessful because the tutorial session has been fully booked
        echo "Sorry, the booking request has been unsuccessful. The tutorial session has been fully booked, please book another one.<br>\n";
      }
      
      // Commit the transaction
      $pdo->commit();
    } catch (PDOException $e) {
      // Something went wrong at some point
      echo "PDO Error: ".$e->getMessage()."<br>\n";
      
      // Roll back the transaction
      $pdo->rollBack();
    }
  }
  
  if (isset($_SESSION['submit'])) {
    // Check whether name and email are valid
    $error = validateInputs($_SESSION['name'],$_SESSION['email']);
    if ($error) {
      // Show the various menus and text fields
      printForm();
      
      // Show a confirmation that the booking request has been unsuccessful because of invalid name or email
      echo "Sorry, the booking request has been unsuccessful.<br>\n";
      
      // Print the error message
      echo $error;
    } else {
      // Try the transaction of booking
      book();
    }
  } else {
      // Show the various menus and text fields
      printForm();
  }
?>
  </body>
</html>
