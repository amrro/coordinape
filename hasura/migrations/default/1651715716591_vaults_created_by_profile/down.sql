alter table vaults add column created_by bigint not null;

alter table vaults
  add constraint "vaults_created_by_fkey"
  foreign key ("created_by")
  references users ("id") on update no action on delete no action;
