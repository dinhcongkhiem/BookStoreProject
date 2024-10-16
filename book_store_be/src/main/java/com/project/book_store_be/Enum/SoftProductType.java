package com.project.book_store_be.Enum;

public enum SoftProductType {
    NEWEST("newest"),
    OLDEST("oldest"),
    TOP_SELLER("top_seller"),
    PRICE_ASC("price_asc"),
    PRICE_DESC("price_desc"),
    ID_ASC("id_asc"),
    ID_DESC("id_desc"),
    NAME_ASC("name_asc"),
    NAME_DESC("name_desc"),
    QTY_ASC("qty_asc"),
    QTY_DESC("qty_desc"),
    STATUS_ASC("status_asc"),
    STATUS_DESC("status_desc");

    private final String value;

    SoftProductType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SoftProductType fromValue(String value) {
        for (SoftProductType type : SoftProductType.values()) {
            if (type.getValue().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid sort type: " + value);
    }
}
