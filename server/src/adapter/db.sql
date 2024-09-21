create table
  "Users" (
    "key" bigint not null generated always as identity,
    "id" text not null unique,
    "pk" text not null unique,
    "password" text not null,
    primary key ("key")
  );

create table
  "Transactions" (
    "key" bigint not null generated always as identity,
    "from_pk" text not null,
    "to_pk" text not null,
    "amount" decimal(10, 5) not null,
    "time" bigint not null unique,
    primary key ("key")
  );