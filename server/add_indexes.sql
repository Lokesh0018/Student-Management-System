ALTER TABLE students ADD INDEX idx_class_id (class_id);
ALTER TABLE classes ADD INDEX idx_teacher_id (teacher_id);
ALTER TABLE students ADD INDEX idx_parent_user_id (parent_user_id);
