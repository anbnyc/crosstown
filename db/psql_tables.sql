CREATE TABLE datasets
(
	bod_id character varying(11),
	date date,
	office character varying(50),
	district_key character varying(4),
	rows int8 NOT NULL
);

CREATE TABLE results
(
	bod_id character varying(11),
	ad int4 NOT NULL,
	ed int4 NOT NULL,
	county character varying(20),
	edad_status character varying(50),
	event character varying(50),
	party character varying(20),
	office character varying(50),
	district_key character varying(4),
	vote_for int4,
	unit_name character varying(60),
	tally int4
);
