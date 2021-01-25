import { type } from "os";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./Entity";

@Entity("contact_cs")
export default class ContactCs {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "content", type: "nvarchar", length: 5000 })
  content: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "answering_questions", type: "nvarchar", nullable: true })
  answeringQuestions: string;

  @ManyToOne(() => User, (user) => user.contactCs)
  @JoinColumn({ name: "user" })
  user: User;
}
