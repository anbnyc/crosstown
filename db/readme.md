### Dependencies

- `psycopg2` for connecting Python to
- postgresql (db name = `crosstown`)

### query functions

#### results

** Unique candidates **
`select distinct event, office, district_key, unit_name from results order by event, office, district_key;`
`select * from results where office = 'Judge of the Civil Court - District' and event = 'Primary Election 2019 - 06/25/2019' and district_key = '1004';`

** Vote count **
`SELECT distinct unit_name, sum(tally) FROM results WHERE unit_name not in ('Public Counter', 'Manually Counted Emergency', 'Absentee / Military', 'Affidavit') GROUP BY unit_name;` (add more WHERE to get specific race)

### qa functions

#### datasets

- `select * from datasets order by date, office, district_key;`
- `select distinct office, count(*) from (select * from datasets order by date, office, district_key) as foo group by foo.office order by foo.office;` (A)
- `select * from datasets where office like '%Governor%';`

#### results

- `select distinct event, office, district_key, count(*) from results group by event, office, district_key order by event, office, district_key;`
- `select distinct office, count(*) from (select distinct event, office, district_key, count(*) from results group by event, office, district_key order by event, office, district_key) as foo group by foo.office order by foo.office;` (B): this should match (A) above
- `select distinct office, count(*) from results where office like '%Governor%' group by office;`
