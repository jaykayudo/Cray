fn main(password: str<100>) -> pub [u8; 32] {
    let password_bytes = password.as_bytes(); // [u8; 32]
    let hash = sha256::sha256_var(password_bytes, password_bytes.len() as u64);
    hash
}

#[test]
fn test_main() {
    main("mysecretpassword");
}