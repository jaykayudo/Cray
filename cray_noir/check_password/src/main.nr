use dep::std::hash::pedersen_hash;

fn main(password: Field, password_hash: pub Field) -> pub bool {
    
    let hash = pedersen_hash([password,0]);
    assert(password_hash == hash, "Password is incorrect");
    true
}

#[test]
fn test_main() {
    let password = "mysecretpassword";
    let password_field = Field::from_le_bytes(password.as_bytes());
    let password_hash = pedersen_hash([password_field,0]);
    let check = main(password_field, password_hash);
    println(check);
}