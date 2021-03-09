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
  Followers,
  Following,
  Post,
  Business,
  Comment,
  ContactCs,
  Report,
  Chat,
  ChatRoom,
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

  @Column({ name: "distance", type: "bigint", default: 20 })
  distance: number;

  @Column({ name: "device_token", type: "nvarchar" })
  deviceToken: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

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

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.user)
  @JoinColumn({ name: "chat_room" })
  chatRoom: ChatRoom[];
}
