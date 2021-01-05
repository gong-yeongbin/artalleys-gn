import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("user")
export default class User {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "uid", type: "nvarchar" })
  uid: string;

  @Column({ name: "phone_number", type: "nvarchar" })
  phoneNumber: string;

  @Column({ name: "email", type: "nvarchar", length: 45, nullable: true })
  email: string;

  @Column({ name: "nick_name", type: "nvarchar", length: 45, nullable: true })
  nickName: string;

  @Column({
    name: "profile_image",
    type: "nvarchar",
    length: 1024,
    nullable: true,
  })
  profileImage: string;

  @Column({ name: "connection_id", type: "nvarchar", nullable: true })
  connectionId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
