fn main(age: u8, min_age: pub u8) -> pub bool {
    assert(age >= min_age, "Age is less than minimum age");
    true
}

#[test]
fn test_main() {
    let check = main(25, 18);
    println(check); 
}