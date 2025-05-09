use dep::std::hash::pedersen_hash;

fn main(password: Field) -> pub Field {
    let hash =  pedersen_hash([password,0]);
    hash
}

#[test]
fn test_main() {
    let password: Field = 1;
    let hash = main(password);
    println(hash);
}