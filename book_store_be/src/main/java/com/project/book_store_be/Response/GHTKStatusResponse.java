package com.project.book_store_be.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GHTKStatusResponse {
    private boolean success;
    private String message;
    private Order order;
    @Data
    @Builder
    public static class Order {
        @JsonProperty("label_id")
        private String labelId;

        @JsonProperty("partner_id")
        private String partnerId;

        private String status;

        @JsonProperty("status_text")
        private String statusText;

        private String created;
        private String modified;
        private String message;

        @JsonProperty("pick_date")
        private String pickDate;

        @JsonProperty("deliver_date")
        private String deliverDate;

        @JsonProperty("customer_fullname")
        private String customerFullname;

        @JsonProperty("customer_tel")
        private String customerTel;

        private String address;

        @JsonProperty("storage_day")
        private Integer storageDay;

        @JsonProperty("ship_money")
        private Integer shipMoney;

        private Integer insurance;
        private Integer value;
        private Integer weight;

        @JsonProperty("pick_money")
        private Integer pickMoney;

        @JsonProperty("is_freeship")
        private Integer isFreeship;

    }

}
