import 'module-alias/register';
import config from 'config';
import { build } from 'src/app';

const start = async () => {
  const app = build();
  try {
    await app.listen(config.get('port'));
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
