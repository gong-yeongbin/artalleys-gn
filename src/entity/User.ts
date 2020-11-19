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

  @Column({ name: "phone_number", type: "integer" })
  phoneNumber: number;

  @Column({ name: "email", type: "nvarchar", length: 45 })
  email: string;

  @Column({ name: "nick_name", type: "nvarchar", length: 45 })
  nickName: string;

  @Column({ name: "profile_image", type: "nvarchar", length: 1024 })
  profileImage: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
