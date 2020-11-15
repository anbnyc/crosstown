### Dependencies

- `psycopg2` for connecting Python to
- postgresql (db name = `crosstown`)

### data processing
- `./psql_tables.sql` contains queries to create database tables
- `./clean_csv.ipynb` contains functions to import CSVs, clean, and upload to DB
- CSVs should be saved at `db/data/raw/[YYYY]/[BOD_ID].csv`

### query functions

#### results tables

** Unique candidates **
`select distinct event, office, district_key, unit_name from results order by event, office, district_key;`
`select * from results where office = 'Judge of the Civil Court - District' and event = 'Primary Election 2019 - 06/25/2019' and district_key = '1004';`

** Vote count **
`SELECT distinct unit_name, sum(tally) FROM results WHERE unit_name not in ('Public Counter', 'Manually Counted Emergency', 'Absentee / Military', 'Affidavit') GROUP BY unit_name;` (add more WHERE to get specific race)

#### materialized views

** results_candidate_pct **
Sum and percent of votes for candidates

### qa functions

#### datasets

- `select * from datasets order by date, office, district_key;` (C)
- `select distinct office, count(*) from (select * from datasets order by date, office, district_key) as foo group by foo.office order by foo.office;` (A)
- `select * from datasets where office like '%Governor%';`

#### results

- `select distinct event, office, district_key, count(*) from results group by event, office, district_key order by event, office, district_key;` (D): this should give the same data as (C) above, with some different columns
- `select distinct office, count(*) from (select distinct event, office, district_key, count(*) from results group by event, office, district_key order by event, office, district_key) as foo group by foo.office order by foo.office;` (B): this should match (A) above
- `select distinct office, count(*) from results where office like '%Governor%' group by office;`
- `select * from (select ad, ed, event, office, district_key, unit_name, count(*) from results group by ad, ed, event, office, district_key, unit_name) as foo where foo.count > 1;`: Dupe checking, should return 0 rows

#### comparing datasets and results

Mismatch checking, should return 0 rows
`select * from ( select distinct right(event, 10) as revent, office, district_key, count(*) from results group by revent, office, district_key order by revent, office, district_key ) as a full outer join ( select to_char(date,'MM/dd/yyyy') as fdate, office, district_key, rows from datasets order by fdate, office, district_key ) as b on a.revent = b.fdate and a.office = b.office and a.district_key = b.district_key where a.count != b.rows;`

#### special cases

In the following cases due to character limits in the DB table structure, the following values were edited:

- 2017-11-07 office `Authorizing the Use of Forest Preserve Land for Specified Purposes` => `Forest Preserve Land` (ballot initiative)
- 2016-04-19 event `Special Election 59 62 and 65 Assembly - 04/19/2016` => `Special Election 59 62 65 Assembly - 04/19/2016` (special election)
- 2014-11-04 office `Permitting Electronic Distribution of State Legislative Bills` => `Electronic State Bills` (ballot initiative)
