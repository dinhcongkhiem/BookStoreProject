package com.project.book_store_be.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class GHTKWebhookPayload {
    @JsonProperty("partner_id")
    private String partnerId;

    @JsonProperty("label_id")
    private String labelId;

    @JsonProperty("status_id")
    private Integer statusId;

    @JsonProperty("action_time")
    private OffsetDateTime actionTime;

    @JsonProperty("reason_code")
    private String reasonCode;

    @JsonProperty("reason")
    private String reason;

    @JsonProperty("weight")
    private Float weight;

    @JsonProperty("fee")
    private Integer fee;

    @JsonProperty("pick_money")
    private Integer pickMoney;

    @JsonProperty("return_part_package")
    private Integer returnPartPackage;

}
