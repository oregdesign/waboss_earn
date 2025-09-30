--
-- PostgreSQL database dump
--

\restrict RIa7r5XPA22g48WFvCSMk7UBow1w9UittAe0srFICHWL1oKcBJlxqWdYVfOdvYk

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: temp_whatsapp_links; Type: TABLE; Schema: public; Owner: waboss_admin
--

CREATE TABLE public.temp_whatsapp_links (
    id integer NOT NULL,
    user_id integer NOT NULL,
    sid text NOT NULL,
    phone text NOT NULL,
    token text,
    qrstring text,
    qrimagelink text,
    infolink text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.temp_whatsapp_links OWNER TO waboss_admin;

--
-- Name: temp_whatsapp_links_id_seq; Type: SEQUENCE; Schema: public; Owner: waboss_admin
--

CREATE SEQUENCE public.temp_whatsapp_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.temp_whatsapp_links_id_seq OWNER TO waboss_admin;

--
-- Name: temp_whatsapp_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: waboss_admin
--

ALTER SEQUENCE public.temp_whatsapp_links_id_seq OWNED BY public.temp_whatsapp_links.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: waboss_admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    whatsapp_phone text
);


ALTER TABLE public.users OWNER TO waboss_admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: waboss_admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO waboss_admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: waboss_admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: whatsapp_accounts; Type: TABLE; Schema: public; Owner: waboss_admin
--

CREATE TABLE public.whatsapp_accounts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    sid text NOT NULL,
    phone text NOT NULL,
    unique_id text,
    token text,
    qrstring text,
    qrimagelink text,
    infolink text,
    status text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT whatsapp_accounts_status_check CHECK ((status = ANY (ARRAY['connected'::text, 'disconnected'::text])))
);


ALTER TABLE public.whatsapp_accounts OWNER TO waboss_admin;

--
-- Name: whatsapp_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: waboss_admin
--

CREATE SEQUENCE public.whatsapp_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.whatsapp_accounts_id_seq OWNER TO waboss_admin;

--
-- Name: whatsapp_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: waboss_admin
--

ALTER SEQUENCE public.whatsapp_accounts_id_seq OWNED BY public.whatsapp_accounts.id;


--
-- Name: temp_whatsapp_links id; Type: DEFAULT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.temp_whatsapp_links ALTER COLUMN id SET DEFAULT nextval('public.temp_whatsapp_links_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: whatsapp_accounts id; Type: DEFAULT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.whatsapp_accounts ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_accounts_id_seq'::regclass);


--
-- Name: temp_whatsapp_links temp_whatsapp_links_pkey; Type: CONSTRAINT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.temp_whatsapp_links
    ADD CONSTRAINT temp_whatsapp_links_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: whatsapp_accounts whatsapp_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.whatsapp_accounts
    ADD CONSTRAINT whatsapp_accounts_pkey PRIMARY KEY (id);


--
-- Name: temp_whatsapp_links temp_whatsapp_links_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.temp_whatsapp_links
    ADD CONSTRAINT temp_whatsapp_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: whatsapp_accounts whatsapp_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waboss_admin
--

ALTER TABLE ONLY public.whatsapp_accounts
    ADD CONSTRAINT whatsapp_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict RIa7r5XPA22g48WFvCSMk7UBow1w9UittAe0srFICHWL1oKcBJlxqWdYVfOdvYk

