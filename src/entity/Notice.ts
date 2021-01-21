import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
@Entity("notice")
export default class Notice {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "title", type: "nvarchar", length: 100 })
  title: string;

  @Column({ name: "category", type: "nvarchar" })
  category: string;

  @Column({ name: "push_notification", type: "boolean", default: false })
  pushNotification: boolean;

  @Column({ name: "publish", type: "boolean", default: false })
  publish: boolean;

  @Column({ name: "content", type: "nvarchar", length: 5000 })
  content: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
