// interface IQuerystring {
//   username: string;
//   password: string;
// }
//
// interface IHeaders {
//   'H-Custom': string;
// }
//
// instance.get<{ Querystring: IQuerystring; Headers: IHeaders }>(
//   '/auth',
//   async (request, reply) => {
//     const { username, password } = request.query;
//     const customerHeader = request.headers['H-Custom'];
//     console.log(username);
//     console.log(password);
//     // do something with request data
//
//     return 'logged insd!';
//   }
// );
