fn main(country: Field, country_to_check: Field) -> pub bool {
    assert(country == country_to_check, "Country is not valid");
    true
}   

#[test]
fn test_main() {
    let country = "Brazil";
    let country_to_check = "Brazil";
    let country_as_bytes = country.as_bytes();
    let country_as_field = Field::from_le_bytes(country_as_bytes);
    let country_to_check_as_bytes = country_to_check.as_bytes();
    let country_to_check_as_field = Field::from_le_bytes(country_to_check_as_bytes);
    let check = main(country_as_field, country_to_check_as_field);
    println(check);
}