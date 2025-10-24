use std::io;

fn main() {
    let mut counter = 0;

    
    loop {
        println!("Current counter: {}", counter);
        println!("Choose");
        println!("1. Add 1");
        println!("2. Subtract 1");
        println!("3. Reset to 0");
        println!("4. Quit");
        let mut input = String::new();


        io::stdin().read_line(&mut input).expect("Cant read inputs");

        let choice = input.trim();


        if choice == "1" {
            counter = counter + 1;
            println!("Added 1");
        } else if choice == "2" {
            counter = counter - 1;
            println!("Subtracted 1");
        } else if choice == "3" {
            counter = 0;
            println!("Reset to 0");
        } else if choice == "4" {
            println!("Quitted");
            break;
        } else {
            println!("Plz enter a valid choice");
        }
        println!(); 
    }


}
