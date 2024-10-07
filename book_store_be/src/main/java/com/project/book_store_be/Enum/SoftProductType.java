package com.project.book_store_be.Enum;

public enum SoftProductType {
    NEWEST("newest"),
    TOPSELLER("top_seller"),
    PRICE_ASC("price_asc"),
    PRICE_DESC("price_desc");

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
