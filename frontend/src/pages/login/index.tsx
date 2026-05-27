import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Toast } from 'antd-mobile'
import { login, register } from '../../api/user'
import './index.css'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true)
    try {
      if (isRegister) {
        if (values.password !== values.confirmPassword) {
          Toast.show({ content: '两次密码不一致', position: 'center' })
          return
        }
        await register(values.username, values.password, values.nickname)
        Toast.show({ content: '注册成功，请登录', position: 'center' })
        setIsRegister(false)
      } else {
        const res: any = await login(values.username, values.password)
        localStorage.setItem('token', res?.data?.token)
        Toast.show({ content: '登录成功', position: 'center' })
        navigate('/')
      }
    } catch (err: any) {
      Toast.show({ content: err.response?.data?.error || '操作失败', position: 'center' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-500 to-indigo-600 px-6">
      <div className="login-logo mb-8">
        <h1 className="text-4xl font-bold text-white tracking-wider">StarTrail</h1>
        <p className="text-white/80 text-center mt-2">追星日记平台</p>
      </div>

      <div className="login-card w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
          {isRegister ? '创建账号' : '欢迎回来'}
        </h2>

        <Form layout="vertical" onFinish={onFinish} footer={
          <Button block type="submit" color="primary" size="large" loading={loading}
            className="login-btn !rounded-lg !h-11 !text-base">
            {isRegister ? '注册' : '登录'}
          </Button>
        }>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" clearable className="!rounded-lg" />
          </Form.Item>
          {isRegister && (
            <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
              <Input placeholder="请输入昵称" clearable className="!rounded-lg" />
            </Form.Item>
          )}
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input type="password" placeholder="请输入密码" clearable className="!rounded-lg" />
          </Form.Item>
          {isRegister && (
            <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true, message: '请再次输入密码' }]}>
              <Input type="password" placeholder="请再次输入密码" clearable className="!rounded-lg" />
            </Form.Item>
          )}
        </Form>

        <div className="text-center mt-4">
          <span className="text-gray-500 text-sm">{isRegister ? '已有账号？' : '没有账号？'}</span>
          <span className="text-purple-600 text-sm font-medium cursor-pointer ml-1 hover:text-purple-800"
            onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? '去登录' : '去注册'}
          </span>
        </div>
      </div>
    </div>
  )
}
