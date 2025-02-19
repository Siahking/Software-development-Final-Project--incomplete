package models

import (
	"strconv"
)

func ConnectionValidator(valueStr string, column string) (string, string, int) {
	value, converstionErr := strconv.Atoi(valueStr)
	if converstionErr != nil {
		return "Error", "Id must be numeric", 0
	} else if column != "worker_id" && column != "location_id" && column != "id" {
		return "Error", "column must be either be worker_id,location_id or id", 0
	} else {
		return "Success", "", value
	}
}
