-- 删除 room_members 表的唯一索引 unique_room_user
-- 这个索引阻止了用户多次加入和离开房间，需要删除以支持历史记录功能

-- MySQL 不支持 DROP INDEX IF EXISTS，需要先检查索引是否存在
-- 方法 1：直接执行（如果索引存在会成功，如果不存在会报错，可以忽略）
DROP INDEX `unique_room_user` ON `room_members`;

-- 方法 2：先检查再删除（推荐）
-- 先执行：SHOW INDEX FROM `room_members` WHERE Key_name = 'unique_room_user';
-- 如果返回结果，再执行：DROP INDEX `unique_room_user` ON `room_members`;

-- 注意：普通索引 idx_room_user 会保留，用于提高查询性能

