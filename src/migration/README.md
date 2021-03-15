# Migrations
Database migrations are carried out using [flyway](https://flywaydb.org/). Refer to it's [documentation](https://flywaydb.org/documentation/) for more information.

## Getting Started
### Versioning
Refer to flyways versioning [naming convention](https://flywaydb.org/documentation/migrations#naming).
```
# Example
V1__Example.sql

Prefix: V
Version: Version number with dots or underscores
Separator: __ (two underscores)
Description: Underscores or spaces separate the words
Suffix: .sql
```
### Configuration File
> **_NOTE:_** configuration files are not checked into version control

Configuration files should be saved in each folder as `flyway.conf`.
```
|-- .migrations
|   |-- prod
|       |-- flyway.conf
|   |-- staging
|       |-- flyway.conf
```

```
# Filename 'flyway.conf'
# Sample configuration
flyway.url=
flyway.user=
flyway.password=
flyway.defaultSchema=
flyway.schemas=
flyway.locations=
```

More information about editing the configuration file can be found on the [website](https://flywaydb.org/documentation/configfiles)

> **_NOTE:_** Production Environment Database connection  
> Production databases run inside a private subnet in the VPC. Access to the database to the public is only allowed by connecting to a public EC2 instance and creating a port forward to the database. Before connecting to production databases, ensure a port forward is established.
> ```
> # Create a port forward from EC2 jumphost to production DB
> ssh -N -L [local port]:[rds endpoint]:[rds port] [user]@[ec2 jumphost dns/ip] -i [private key]
> # Example below
> ssh -N -L 5826:prod-compose-rds.randomvalue.ap-northeast-2.rds.amazonaws.com:3306 ec2-user@13.101.24.200 -i "~/.ssh/myKey.pem"
> ```


## Usage
### Baseline
Extract the sql ddl of the existing database. Compose uses `mysql 5.7.12` as it's database. Extract the database DDL using `mysqldump` tool

```
# Ensure correct version of mysqldump tool is being used
mysqldump -u root -p --no-data dbname > schema.sql
# Run flyway baseline
flyway baseline
```

### Migration
Run migration by using `flyway migrate` command.
```
# Running migration on staging DB
# staging/flyway.conf - should be present
flyway migrate
```

### Failed migration (repair)
> Note: Failed migrations have to be manually reverted

Run `flyway repair` and retry the migration.
