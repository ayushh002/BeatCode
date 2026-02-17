import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";

export default function ChatAi({ problem, code }) {
    const [messages, setMessages] = useState([]);
    const messageEndRef = useRef();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const onSubmit = async (data) => {
        setMessages(prev => [...prev, { role: 'user', parts: [{ text: data.message }] }]);
        reset();
        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: [...messages, { role: 'user', parts: [{ text: data.message }] }],
                problem,
                code
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.text }]
            }])
        }

        catch (err) {
            console.error("Api Error: ", err);
            setMessages(prev => [...prev, {
                role: "model",
                parts: [{ text: "I encountered an error" }]
            }])
        }
    }

    return (
        <div className="flex flex-col max-h-[70vh] min-h-[450px] rounded-xl overflow-hidden border border-[#2A2A2A] bg-[#1E1E1E] text-gray-200">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                {messages.length === 0 ? (
                    /* Empty State */
                    <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <h1 className="text-2xl md:text-2xl font-semibold text-white">
                            Ask any question?
                        </h1>
                        <p className="mt-2 text-sm text-gray-400">
                            I can help explain logic, optimize code, or debug issues
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={
                                        `max-w-[75%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap
                                        ${message.role === "user"
                                            ? "bg-orange-400 text-white rounded-br-none border border-[#4A4A4A]"
                                            : "bg-[#222222] text-gray-300 rounded-bl-none border border-[#2A2A2A]"
                                        }
                                    `}
                                >
                                    {message.parts[0].text}
                                </div>
                            </div>
                        ))}
                        <div ref={messageEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-4 border-t border-[#2A2A2A] bg-[#1E1E1E]"
            >
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-1.5 rounded-md bg-[#222222] text-gray-200 placeholder-gray-500 outline-none border border-[#2A2A2A] focus:border-gray-500"
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button
                        type="submit"
                        disabled={errors.message}
                        className="px-4 py-2 rounded-md text-sm font-semibold bg-orange-500 text-gray-200 hover:bg-orange-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );

}