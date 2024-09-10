import asyncHandler from 'express-async-handler'

import { prisma } from '../../prisma.js'
import { calculateMinute } from '../calculate-minute.js'

// @desc    Get workout log
// @route   GET /api/workouts/log/:id
// @access  Private
export const getWorkoutLog = asyncHandler(async (req, res) => {
  // Ищем лог тренировки в базе данных по его уникальному идентификатору (ID), который передан в параметрах запроса.
  // Используем метод findUnique для поиска одной записи.
  const workoutLog = await prisma.workoutLog.findUnique({
    where: {
      id: +req.params.id // Преобразуем ID из строки в число и используем для поиска.
    },
    // Включаем связанные данные: тренировку и логи упражнений.
    include: {
      workout: {
        // Для найденной тренировки также включаем связанные упражнения.
        include: {
          exercises: true // Включаем информацию обо всех упражнениях, связанных с тренировкой.
        }
      },
      exerciseLogs: {
        // Сортируем логи упражнений по ID по возрастанию.
        orderBy: {
          id: 'asc' // Сортировка логов упражнений по порядку их создания (по возрастанию ID).
        },
        // Включаем связанные упражнения для каждого лога упражнения.
        include: {
          exercise: true // Включаем информацию о самом упражнении для каждого лога.
        }
      }
    }
  })

  // Если лог тренировки не найден, отправляем ошибку с кодом 404 (Not Found).
  if (!workoutLog) {
    res.status(404)
    throw new Error('Workout Log not found!')
  }

  // Если лог тренировки найден, отправляем ответ в формате JSON.
  // В ответ добавляем поле "minute", которое вычисляется с помощью функции calculateMinute.
  // Это значение зависит от количества упражнений в тренировке.
  res.json({
    ...workoutLog, // Включаем все поля найденного лога тренировки.
    minute: calculateMinute(workoutLog.workout.exercises.length) // Вычисляем предполагаемую продолжительность тренировки.
  })
})
