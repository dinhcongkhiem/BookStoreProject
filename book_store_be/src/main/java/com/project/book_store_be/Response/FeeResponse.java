package com.project.book_store_be.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeeResponse {
    private boolean success;
    private String message;
    private Fee fee;

    // Getters and setters
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Fee {
        private String name;
        private int fee;
        private int insurance_fee;
        private boolean delivery;
        private List<ExtFee> extFees;

        // Getters and setters
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class ExtFee {
            private String display;
            private String title;
            private int amount;
            private String type;

            // Getters and setters
        }
    }
}
