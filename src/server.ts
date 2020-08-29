import 'module-alias/register';
import config from 'config';
import app from 'src/app';

const start = async () => {
  try {
    await app.listen(config.get('port'));
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
