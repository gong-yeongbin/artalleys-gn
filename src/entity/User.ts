import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import {
  Image,
  Location,
  Followers,
  Following,
  Post,
  Business,
} from "./Entity";

@Entity("user")
export default class User {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "uid", type: "nvarchar" })
  uid: string;

  @Column({ name: "nick_name", type: "nvarchar", length: 20, nullable: true })
  nickName: string;

  @Column({ name: "phone_number", type: "nvarchar" })
  phoneNumber: string;

  @Column({ name: "email", type: "nvarchar", length: 45, nullable: true })
  email: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToOne(() => Location, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "location_id" })
  location: Location;

  @OneToOne(() => Image, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "image_id" })
  image: Image;

  @OneToOne(() => Followers, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "followers_id" })
  followers: Followers;

  @OneToOne(() => Following, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "following_id" })
  following: Following;

  @OneToMany(() => Post, (post) => post.user)
  @JoinColumn({ name: "post" })
  post: Post[];

  @OneToMany(() => Business, (business) => business.user)
  @JoinColumn({ name: "business" })
  business: Business[];
}
