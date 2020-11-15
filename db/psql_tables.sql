CREATE DATABASE crosstown;

CREATE TABLE datasets
(
	bod_id character varying(11),
	date date,
	event_name character varying(50),
	office character varying(50),
	district_key character varying(4),
	rows int8 NOT NULL
);

CREATE TABLE results
(
	ad int4 NOT NULL,
	ed int4 NOT NULL,
	county character varying(20),
	edad_status character varying(50),
	event character varying(75),
	party character varying(20),
	office character varying(50),
	district_key character varying(4),
	vote_for int4,
	unit_name character varying(75),
	tally int4,
	bod_id character varying(11)
);

CREATE MATERIALIZED VIEW results_candidate_pct AS
SELECT
	candidate_level.ad,
	candidate_level.ed,
	candidate_level.event,
	candidate_level.party,
	candidate_level.office,
	candidate_level.district_key,
	candidate_level.unit_name,
	candidate_level.tally,
	aggregate_level.sum_tally,
	COALESCE(
		CAST(
			CAST(candidate_level.tally as float) / CAST(NULLIF(aggregate_level.sum_tally, 0) as float)
			as decimal(5,4)
		),
		0
	) as tally_pct
FROM results as candidate_level
LEFT JOIN (
	SELECT ad, ed, event, party, office, district_key, sum(tally) as sum_tally
	FROM (
		SELECT ad, ed, event, party, office, district_key, unit_name, tally
		FROM results
		WHERE unit_name not in ('Public Counter', 'Manually Counted Emergency', 'Absentee / Military', 'Affidavit', 'Federal')
	) as foo
	GROUP BY ad, ed, event, party, office, district_key
) as aggregate_level
ON
	candidate_level.ad = aggregate_level.ad
	and candidate_level.ed = aggregate_level.ed
	and candidate_level.event = aggregate_level.event
	and COALESCE(candidate_level.party, '') = COALESCE(aggregate_level.party, '')
	and candidate_level.office = aggregate_level.office
	and candidate_level.district_key = aggregate_level.district_key
WHERE candidate_level.unit_name not in ('Public Counter', 'Manually Counted Emergency', 'Absentee / Military', 'Affidavit', 'Federal');

CREATE MATERIALIZED VIEW results_menu_options AS
SELECT DISTINCT
	event,
	office,
	district_key,
	party,
	unit_name
FROM results
WHERE unit_name not in ('Public Counter', 'Manually Counted Emergency', 'Absentee / Military', 'Affidavit', 'Federal')
ORDER BY event, office, district_key, party;

CREATE MATERIALIZED VIEW results_aded_list AS
SELECT DISTINCT
	CONCAT(
		ad,
		RIGHT(
			CONCAT(
				'000',
				ed
			), 3
		)
	) as aded
FROM results_candidate_pct
ORDER BY aded;

REFRESH MATERIALIZED VIEW results_candidate_pct;
REFRESH MATERIALIZED VIEW results_menu_options;
REFRESH MATERIALIZED VIEW results_aded_list;
