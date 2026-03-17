const formatResponse = (data, message) => {
  if (data) {
    const response = { data, message }
    response.data = data

    return response
  }

  return { data: [] }
}

const throwCustomError = (message, status) => {
  const error = new Error(message)
  error.status = status
  throw error
}

module.exports = {
  formatResponse,
  throwCustomError,
}
