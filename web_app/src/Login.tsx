import { useState } from 'react';
import './styles/global.css';
import { useForm } from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'

const createUserFormSchema = z.object({
  email: z.string(),
  senha: z.string()
})

type CreateUserFormData = z.infer<typeof createUserFormSchema>

export function Login() {
  const { register, handleSubmit} = useForm <CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  })

  function createUser(data: any) {
    console.log(data)
  }

  return (
    <main className="h-screen bg-zinc-50 flex items-center justify-center">
      <form 
        onSubmit={handleSubmit(createUser)}
        className="flex flex-col gap-4 w-full max-w-xs"
      >

        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input 
          type="email" 
          className="border border-zinc-200 shadow-sm rounded h-8 px-3"
          {...register('email')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="senha">Senha</label>
          <input 
          type="senha" 
          className="border border-zinc-200 shadow-sm rounded h-8 px-3"
          {...register('senha')}
          />
        </div>

        <button type="submit" className="bg-orange-500 rounded text-white h-10 hover:bg-orange-600"
        >Entrar</button>
        
        <button type="submit" className="bg-transparent	text-sky-500 rounded text-white hover:text-sky-700"
        >Você é novo por aqui? Cadastre-se</button>

      </form>
    </main>
  )
}
