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
  Comment,
  ContactCs,
  Report,
  Chat,
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
  @JoinColumn({ name: "location" })
  location: Location;

  @OneToOne(() => Image, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "image" })
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

  @OneToMany(() => Comment, (comment) => comment.user)
  @JoinColumn({ name: "comment" })
  comment: Comment[];

  @OneToMany(() => ContactCs, (contactCs) => contactCs.user)
  @JoinColumn({ name: "contact_cs" })
  contactCs: ContactCs[];

  @OneToMany(() => Report, (report) => report.user, { nullable: true })
  @JoinColumn({ name: "report" })
  report: Report[];

  @OneToMany(() => Chat, (chat) => chat.sendId)
  @JoinColumn({ name: "sendId" })
  sendId: Chat;

  @OneToMany(() => Chat, (chat) => chat.receiveId)
  @JoinColumn({ name: "receiveId" })
  receiveId: Chat;
}
