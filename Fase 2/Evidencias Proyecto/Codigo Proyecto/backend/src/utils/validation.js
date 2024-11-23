export function getZodPath(error){
  const paths = [];
  error.errors.forEach(err => paths.push(err.path[0]));

  return paths;
}