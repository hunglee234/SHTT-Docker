const { performance } = require("perf_hooks"); // Modult perf_hooks đo hiệu suất

// fn là 1 hàm bất đồng bộ async cần đo thời gian thực thi

const logTime = async (fn, name = "Function") => {
  const start = performance.now(); // ghi lại thời gian bắt đầu thực thi hàm fn()
  const result = await fn(); // gọi và chờ hàm fn() hoàn thành - Vì fn() là một hàm async, nên await đảm bảo rằng mã sẽ đợi cho đến khi fn() hoàn tất.
  const duration = performance.now() - start; // performance.now() ghi lại thời gian sau khi fn() chạy xong
  console.log(`${name} chạy trong ${duration.toFixed(3)}ms`);
  return result;
};

module.exports = logTime;
