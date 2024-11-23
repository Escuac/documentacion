import sty from "./LoginForm.module.css";
import { useForm, useFetch } from "@/hooks";
import { Button } from "@/components/shadcn/button";
import { useEffect } from "react";
import { BASE_API_URL } from "@/constants"
export const LoginForm = () => {
  const { onInputChange, username, password } = useForm({
    username: '',
    password: ''
  });
  
  const { data, error, fetchData } = useFetch(true);

  const handleLogin = (e) => {
    e.preventDefault();
    
    fetchData(`${BASE_API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({username: username, password: password})
  });
  }

  useEffect(()=>{
    if(data && !error){
      window.location.href = '/';
    }
  }, [data, error])

  return (
    <div className={sty.container}>
      <div className={sty["comp-logo"]}>
        ApoloSport
      </div>
      <form onSubmit={handleLogin}>
        <div className={sty["input-container"]}>
          <div className="input-group">
            <label htmlFor="username">Usuario</label>
            <input 
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onInputChange}
              autoFocus/>
          </div>
          <div className="input-group mt-2 relative">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onInputChange}
              />
            {error &&
            <p className="text-right text-destructive font-semibold absolute -bottom-6 right-0 text-sm">
              {error.body.message}</p>
        }
          </div>
        </div>

        <div className={sty["input-group-button"]}>
        <Button>Ingresar</Button>
        </div>
      </form>
    </div>
  )
}
