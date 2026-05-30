# Database Audit — Task List

| ID    | Task                                                  | Status |
|-------|-------------------------------------------------------|--------|
| DB1   | Add @@index on Request.userId                         | Done   |
| DB2   | Add @@index on Request.serviceId                      | Done   |
| DB3   | Add @@index on Request.status                         | Done   |
| DB4   | Add @@index on Request.wardNo                         | Done   |
| DB5   | Add @@index on Bid.taskerId                           | Done   |
| DB6   | Add @@index on Bid.requestId                          | Done   |
| DB7   | Add @@index on TaskerAssignment.taskerId              | Done   |
| DB8   | Add @@index on TaskerAssignment.requestId             | Done   |
| DB9   | Add @@index on Review.reviewerId                      | Done   |
| DB10  | Add @@index on Review.revieweeId                      | Done   |
| DB11  | Add @@index on Transaction.userId                     | Done   |
| DB12  | Add @@index on Transaction.transactionUuid            | Done   |
| DB15  | Add @relation FK constraint Review.requestId->Request.id | Done |
| DB16  | Add @relation FK constraint Transaction.requestId->Request.id | Done |
| DB17  | Add @@unique([reviewerId, revieweeId, requestId]) on Review | Done |
