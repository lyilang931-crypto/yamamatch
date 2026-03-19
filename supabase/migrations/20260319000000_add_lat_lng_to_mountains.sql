-- Add latitude/longitude columns to mountains table for weather API integration
alter table mountains
  add column if not exists lat decimal(8, 6),
  add column if not exists lng decimal(9, 6);

-- Update known Kansai mountains with their coordinates
update mountains set lat = 34.7636, lng = 135.2489 where name = '六甲山';
update mountains set lat = 34.7456, lng = 135.2389 where name = '摩耶山';
update mountains set lat = 34.4133, lng = 135.6617 where name = '金剛山';
update mountains set lat = 34.4658, lng = 135.6706 where name = '葛城山';
update mountains set lat = 35.2644, lng = 135.8683 where name = '武奈ヶ岳';
update mountains set lat = 35.2167, lng = 135.8833 where name = '蓬莱山';
update mountains set lat = 34.1867, lng = 136.0942 where name = '大台ヶ原';
update mountains set lat = 34.2200, lng = 135.9100 where name = '大峰山';
update mountains set lat = 34.1933, lng = 135.9133 where name = '八経ヶ岳';
update mountains set lat = 34.4422, lng = 136.0508 where name = '高見山';
update mountains set lat = 34.6819, lng = 135.6847 where name = '生駒山';
update mountains set lat = 35.0750, lng = 135.5083 where name = '愛宕山';
update mountains set lat = 35.0756, lng = 135.8308 where name = '比叡山';
update mountains set lat = 34.7500, lng = 135.6833 where name = '交野山';
update mountains set lat = 34.5167, lng = 135.6833 where name = '明神山';
update mountains set lat = 34.7289, lng = 135.3214 where name = '有馬四山';
update mountains set lat = 34.8083, lng = 135.2478 where name = '北六甲台';
update mountains set lat = 34.2133, lng = 135.5867 where name = '高野山';
update mountains set lat = 34.3950, lng = 135.7611 where name = '岩湧山';
update mountains set lat = 34.6056, lng = 135.9231 where name = '曽爾高原';
update mountains set lat = 34.5597, lng = 135.9036 where name = '三峰山';
update mountains set lat = 34.8167, lng = 135.2833 where name = '再度山';
update mountains set lat = 35.1667, lng = 135.7667 where name = '京都北山';
update mountains set lat = 35.2667, lng = 135.9000 where name = '比良山';
