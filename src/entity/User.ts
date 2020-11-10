import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "phone_number", type: "integer" })
  phoneNumber: number;

  @Column({ name: "email", type: "nvarchar", length: 45 })
  email: string;

  @Column({ name: "nick_name", type: "nvarchar", length: 45 })
  nickName: string;

  @Column({ name: "profile_image", type: "nvarchar", length: 1024 })
  profileImage: string;

  @Column({ name: "create_at" })
  createfAt: Date;

  @Column({ name: "update_at" })
  updateAt: Date;
}
