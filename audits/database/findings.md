# Database Audit — Findings

| ID    | Finding                                                            | Severity | Status |
|-------|--------------------------------------------------------------------|----------|--------|
| DB1   | Missing index on Request.userId — slow joins on user queries       | Medium   | Done   |
| DB2   | Missing index on Request.serviceId — slow service-based lookups    | Medium   | Done   |
| DB3   | Missing index on Request.status — slow status-filtered queries     | Low      | Done   |
| DB4   | Missing index on Request.wardNo — slow ward-based filtering        | Low      | Done   |
| DB5   | Missing index on Bid.taskerId — slow tasker bid lookups            | Medium   | Done   |
| DB6   | Missing index on Bid.requestId — slow request-to-bid joins         | Medium   | Done   |
| DB7   | Missing index on TaskerAssignment.taskerId — slow tasker assignment queries | Medium | Done |
| DB8   | Missing index on TaskerAssignment.requestId — slow assignment joins | Medium  | Done   |
| DB9   | Missing index on Review.reviewerId — slow reviewer lookups         | Medium   | Done   |
| DB10  | Missing index on Review.revieweeId — slow reviewee lookups         | Medium   | Done   |
| DB11  | Missing index on Transaction.userId — slow user transaction queries | Medium  | Done   |
| DB12  | Missing index on Transaction.transactionUuid — slow UUID lookups   | Low      | Done   |
| DB15  | Missing FK constraint on Review.requestId — referential integrity gap | High   | Done   |
| DB16  | Missing FK constraint on Transaction.requestId — referential integrity gap | High | Done |
| DB17  | Missing unique constraint on [reviewerId, revieweeId, requestId] — duplicate reviews possible | High | Done |
