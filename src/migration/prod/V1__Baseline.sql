CREATE TABLE `post` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(30) NOT NULL,
  `view` int(11) NOT NULL DEFAULT '0',
  `number` int(11) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `post_id` varchar(255) NOT NULL,
  `hide` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=latin1

CREATE TABLE `post_normal` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `price` int(11) DEFAULT '0',
  `descriptions` varchar(300) DEFAULT NULL,
  `condition` varchar(255) NOT NULL,
  `active` varchar(255) NOT NULL DEFAULT 'active',
  `firmOnPrice` tinyint(4) NOT NULL DEFAULT '1',
  `post` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f0d355aa8ee46d42b475fd164e` (`post`),
  UNIQUE KEY `REL_f0d355aa8ee46d42b475fd164e` (`post`),
  CONSTRAINT `FK_f0d355aa8ee46d42b475fd164ef` FOREIGN KEY (`post`) REFERENCES `post` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1

CREATE TABLE `post_business` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `detail_title` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `start_time` int(11) NOT NULL DEFAULT '0',
  `end_time` int(11) NOT NULL DEFAULT '0',
  `homepage` varchar(255) NOT NULL,
  `working_hours_descriptions` varchar(1024) NOT NULL,
  `descriptions` varchar(300) NOT NULL,
  `post` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_efdb8b66154b321c4fd01da940` (`post`),
  UNIQUE KEY `REL_efdb8b66154b321c4fd01da940` (`post`),
  CONSTRAINT `FK_efdb8b66154b321c4fd01da9404` FOREIGN KEY (`post`) REFERENCES `post` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1

CREATE TABLE `location` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `longtitude` int(11) NOT NULL,
  `latitude` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `post` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_ebf3c652ee80cf9fac808aa6fc` (`post`),
  UNIQUE KEY `REL_ebf3c652ee80cf9fac808aa6fc` (`post`),
  CONSTRAINT `FK_ebf3c652ee80cf9fac808aa6fc0` FOREIGN KEY (`post`) REFERENCES `post` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=latin1

CREATE TABLE `image` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `post` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8ff87199f9629a32aec13481360` (`post`),
  CONSTRAINT `FK_8ff87199f9629a32aec13481360` FOREIGN KEY (`post`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE `comment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `message` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `deleted` tinyint(4) NOT NULL DEFAULT '0',
  `comment_id` varchar(255) NOT NULL,
  `post_id` bigint(20) DEFAULT NULL,
  `reply_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8aa21186314ce53c5b61a0e8c93` (`post_id`),
  KEY `FK_ba2e38e6e586556dfcb9fb41d1d` (`reply_id`),
  CONSTRAINT `FK_8aa21186314ce53c5b61a0e8c93` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_ba2e38e6e586556dfcb9fb41d1d` FOREIGN KEY (`reply_id`) REFERENCES `comment` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE TABLE `chat` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `send_id` varchar(255) NOT NULL,
  `receive_id` varchar(255) NOT NULL,
  `message` varchar(255) NOT NULL,
  `post` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_cbd0e10190ee2a0660fbb85a89e` (`post`),
  CONSTRAINT `FK_cbd0e10190ee2a0660fbb85a89e` FOREIGN KEY (`post`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1

insert into gn.post_status(status) values("active");
insert into gn.post_status(status) values("reserved");
insert into gn.post_status(status) values("sold out");

insert into gn.post_type(type) values("sell");
insert into gn.post_type(type) values("buy");
insert into gn.post_type(type) values("business");
insert into gn.post_type(type) values("businessPost");

insert into gn.post_category(category) values("Antiques & Collectibles");
insert into gn.post_category(category) values("Arts & Crafts");
insert into gn.post_category(category) values("Baby & Kids");
insert into gn.post_category(category) values("Clothing, Shoes and Accessories");
insert into gn.post_category(category) values("Consumer Electronics");
insert into gn.post_category(category) values("Games, Toys & Hobbies");
insert into gn.post_category(category) values("Health & Beauty");
insert into gn.post_category(category) values("Home & Garden");
insert into gn.post_category(category) values("Home & Interior");
insert into gn.post_category(category) values("Motors & Bikes");
insert into gn.post_category(category) values("Musical Instruments");
insert into gn.post_category(category) values("Books, CDs & Vinyl");
insert into gn.post_category(category) values("Luggage & Travel Gear");
insert into gn.post_category(category) values("Office Products");
insert into gn.post_category(category) values("Pet Supplies");
insert into gn.post_category(category) values("Sports & Outdoors");
insert into gn.post_category(category) values("Others");

insert into gn.post_condition(conditions) values("Other (see descriptions)");
insert into gn.post_condition(conditions) values("For parts");
insert into gn.post_condition(conditions) values("Used (normal wear)");
insert into gn.post_condition(conditions) values("Open box (never used)");
insert into gn.post_condition(conditions) values("Reconditioned/Certified");
insert into gn.post_condition(conditions) values("New (never used)");

insert into gn.business_category(category) values("Arts & Entertainment");
insert into gn.business_category(category) values("Automotive");
insert into gn.business_category(category) values("Beauty & Spas");
insert into gn.business_category(category) values("Education");
insert into gn.business_category(category) values("Financial Services");
insert into gn.business_category(category) values("Food & Drink");
insert into gn.business_category(category) values("Health & Fitness");
insert into gn.business_category(category) values("Home & Interiors");
insert into gn.business_category(category) values("Home Services");
insert into gn.business_category(category) values("Hotels & Travel");
insert into gn.business_category(category) values("Legal");
insert into gn.business_category(category) values("Media");
insert into gn.business_category(category) values("Pets");
insert into gn.business_category(category) values("Professional Services");
insert into gn.business_category(category) values("Real Estates");
insert into gn.business_category(category) values("Restaurants");
insert into gn.business_category(category) values("Clothing, Shoes & Accessories");
insert into gn.business_category(category) values("Games, Toys & Hobbies");
insert into gn.business_category(category) values("Sports & Outdoors");
insert into gn.business_category(category) values("Others");

insert into gn.like_type(type) values("post");
insert into gn.like_type(type) values("business");
insert into gn.like_type(type) values("businessPost");